package com.dorm.repair.security;

public final class UserContext {

    private static final ThreadLocal<CurrentUser> CURRENT_USER = new ThreadLocal<>();

    private UserContext() {
    }

    public static void set(CurrentUser user) {
        CURRENT_USER.set(user);
    }

    public static CurrentUser get() {
        return CURRENT_USER.get();
    }

    public static Long getUserId() {
        CurrentUser user = get();
        return user == null ? null : user.getId();
    }

    public static void clear() {
        CURRENT_USER.remove();
    }
}
