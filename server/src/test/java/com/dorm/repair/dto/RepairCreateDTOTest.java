package com.dorm.repair.dto;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RepairCreateDTOTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void createRejectsInvalidContactPhone() {
        RepairCreateDTO dto = validCreateDTO();
        dto.setContactPhone("notaphone");

        assertThat(validator.validate(dto))
            .anyMatch(violation ->
                violation.getPropertyPath().toString().equals("contactPhone")
                    && violation.getMessage().equals("手机号格式不正确")
            );
    }

    @Test
    void updateInheritsContactPhoneValidation() {
        RepairUpdateDTO dto = new RepairUpdateDTO();
        dto.setDormBuilding("3号楼");
        dto.setRoomNo("301");
        dto.setCategory("水电");
        dto.setTitle("水龙头漏水");
        dto.setDescription("洗手池水龙头持续滴水");
        dto.setContactPhone("12345");

        assertThat(validator.validate(dto))
            .anyMatch(violation ->
                violation.getPropertyPath().toString().equals("contactPhone")
                    && violation.getMessage().equals("手机号格式不正确")
            );
    }

    private RepairCreateDTO validCreateDTO() {
        RepairCreateDTO dto = new RepairCreateDTO();
        dto.setDormBuilding("3号楼");
        dto.setRoomNo("301");
        dto.setCategory("水电");
        dto.setTitle("水龙头漏水");
        dto.setDescription("洗手池水龙头持续滴水");
        dto.setContactPhone("13800000001");
        return dto;
    }
}
