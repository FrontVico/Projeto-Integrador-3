package com.VanControl.VanControl.user.DTO;

import com.VanControl.VanControl.user.Model.User.Role;

public record LoginRequestDTO(String email, String password) {
}
