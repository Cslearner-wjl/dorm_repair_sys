package com.dorm.repair.vo;

public class UploadVO {

    private String fileName;
    private String url;
    private Long size;

    public UploadVO() {
    }

    public UploadVO(String fileName, String url, Long size) {
        this.fileName = fileName;
        this.url = url;
        this.size = size;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }
}
