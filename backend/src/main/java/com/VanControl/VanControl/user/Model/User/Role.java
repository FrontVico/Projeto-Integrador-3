package com.VanControl.VanControl.user.Model.User;

public enum Role {
    CLIENTE,
    ADMIN;

    public String getAuthority() {
        return "ROLE_" + this.name();
    }
}
