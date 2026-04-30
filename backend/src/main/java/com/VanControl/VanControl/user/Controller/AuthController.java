package com.VanControl.VanControl.user.Controller;

import com.VanControl.VanControl.user.DTO.LoginRequestDTO;
import com.VanControl.VanControl.user.DTO.RegisterRequestDTO;
import com.VanControl.VanControl.user.DTO.ResponseDTO;
import com.VanControl.VanControl.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticacao", description = "Login e registro de usuarios")
@SecurityRequirements
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    @Operation(
            summary = "Login",
            description = "Entrada: LoginRequestDTO (email, password). Saida: ResponseDTO (name, token)."
    )
    public ResponseEntity<ResponseDTO> login(@RequestBody LoginRequestDTO dto){
        return new ResponseEntity<>(userService.login(dto), HttpStatus.OK);
    }

    @PostMapping("/register")
    @Operation(
            summary = "Registrar usuario",
            description = "Entrada: RegisterRequestDTO (name, email, password, cpf, telefone, instituicaoEnsino, turno, endereco, cep). Saida: ResponseDTO (name, token)."
    )
    public ResponseEntity<ResponseDTO> register(@RequestBody RegisterRequestDTO dto) {
        return new ResponseEntity<>(userService.registrarUsuario(dto), HttpStatus.CREATED);
    }
}
