package com.VanControl.VanControl.user.service;

import com.VanControl.VanControl.passageiros.service.PassageiroService;
import com.VanControl.VanControl.user.DTO.LoginRequestDTO;
import com.VanControl.VanControl.user.DTO.RegisterRequestDTO;
import com.VanControl.VanControl.user.DTO.ResponseDTO;
import com.VanControl.VanControl.user.Model.User.Role;
import com.VanControl.VanControl.user.Model.User.User;
import com.VanControl.VanControl.user.Repository.UserRepository;
import com.VanControl.VanControl.user.Infra.Security.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final PassageiroService passageiroService;
    private final PasswordEncoder passwordEncoder;

    public ResponseDTO registrarUsuario(RegisterRequestDTO dto) {
        Optional<User> user = this.userRepository.findByEmail(dto.email());

        if(user.isEmpty()) {
            User newUser = new User();
            newUser.setPassword(passwordEncoder.encode(dto.password()));
            newUser.setEmail(dto.email());
            newUser.setName(dto.name());
            newUser.setRole(Role.PASSAGEIRO);
            this.userRepository.save(newUser);

            this.passageiroService.cadastrarPassageiro(dto, newUser);

            String token = this.tokenService.generateToken(newUser);
            return new ResponseDTO(newUser.getName(), token);
        }

        throw new RuntimeException("Passageiro já cadastrado");
    }

    public ResponseDTO login(LoginRequestDTO dto) {
        User user = this.userRepository.findByEmail(dto.email()).orElseThrow(() -> new RuntimeException("User not found"));

        if(passwordEncoder.matches(dto.password(), user.getPassword())){
            String token = this.tokenService.generateToken(user);
            return new ResponseDTO(user.getName(), token);
        }

        throw new RuntimeException("Credenciais inválidas");
    }
}
