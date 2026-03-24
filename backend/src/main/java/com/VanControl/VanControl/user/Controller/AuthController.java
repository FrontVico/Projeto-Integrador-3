package com.VanControl.VanControl.user.Controller;

import com.VanControl.VanControl.user.DTO.LoginRequestDTO;
import com.VanControl.VanControl.user.DTO.RegisterRequestDTO;
import com.VanControl.VanControl.user.DTO.ResponseDTO;
import com.VanControl.VanControl.user.Infra.Security.TokenService;
import com.VanControl.VanControl.user.Model.User.Role;
import com.VanControl.VanControl.user.Model.User.User;
import com.VanControl.VanControl.user.Repository.UserRepository;
import com.VanControl.VanControl.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO> login(@RequestBody LoginRequestDTO dto){
        return new ResponseEntity<>(userService.login(dto), HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<ResponseDTO> register(@RequestBody RegisterRequestDTO dto) {
        return new ResponseEntity<>(userService.registrarUsuario(dto), HttpStatus.CREATED);
    }
}
