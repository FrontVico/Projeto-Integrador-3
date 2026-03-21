package com.VanControl.VanControl.user.DTO;

import com.VanControl.VanControl.user.Model.User.Role;

public record RegisterRequestDTO(String name, String email, String password) {
}
