package com.dorm.repair.mapper;

import com.dorm.repair.entity.User;
import com.dorm.repair.common.UserRole;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {

    int insert(User user);

    User findById(@Param("id") Long id);

    User findByUsername(@Param("username") String username);

    long countUsers(@Param("role") UserRole role, @Param("keyword") String keyword);

    List<User> listUsers(
        @Param("role") UserRole role,
        @Param("keyword") String keyword,
        @Param("offset") int offset,
        @Param("limit") int limit
    );

    List<User> listRepairers();

    int updateBaseInfo(User user);

    int updateRole(@Param("id") Long id, @Param("role") UserRole role);

    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    int softDelete(@Param("id") Long id);
}
