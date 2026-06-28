package com.dorm.repair.controller;

import com.dorm.repair.common.ApiResponse;
import com.dorm.repair.common.BusinessException;
import com.dorm.repair.common.ErrorCode;
import com.dorm.repair.vo.UploadVO;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");

    private final Path uploadRoot;
    private final String publicPath;
    private final long maxFileSizeBytes;

    public UploadController(
        @Value("${app.upload.dir}") String uploadDir,
        @Value("${app.upload.public-path}") String publicPath,
        @Value("${app.upload.max-file-size-bytes}") long maxFileSizeBytes
    ) {
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
        this.publicPath = publicPath.endsWith("/") ? publicPath.substring(0, publicPath.length() - 1) : publicPath;
        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UploadVO> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "File is required");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "File is too large");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Only image files are allowed");
        }

        String extension = resolveExtension(file.getOriginalFilename(), contentType);
        String dateDir = LocalDate.now().format(DATE_FORMATTER);
        String fileName = UUID.randomUUID() + "." + extension;
        Path targetDir = uploadRoot.resolve(dateDir).normalize();
        Path targetFile = targetDir.resolve(fileName).normalize();
        if (!targetFile.startsWith(uploadRoot)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid file path");
        }

        try {
            Files.createDirectories(targetDir);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetFile);
            }
        } catch (IOException exception) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Upload failed");
        }

        String url = publicPath + "/" + dateDir + "/" + fileName;
        return ApiResponse.success(new UploadVO(fileName, url, file.getSize()));
    }

    private String resolveExtension(String originalFilename, String contentType) {
        String extension = "";
        if (originalFilename != null) {
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0 && dotIndex < originalFilename.length() - 1) {
                extension = originalFilename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
            }
        }
        if (ALLOWED_EXTENSIONS.contains(extension)) {
            return extension;
        }
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/gif" -> "gif";
            case "image/webp" -> "webp";
            default -> throw new BusinessException(ErrorCode.BAD_REQUEST, "Unsupported image type");
        };
    }
}
