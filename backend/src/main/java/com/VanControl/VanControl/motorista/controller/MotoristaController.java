package com.VanControl.VanControl.motorista.controller;

import com.VanControl.VanControl.motorista.domain.dto.request.AtualizarTelefoneMotoristaRequestDto;
import com.VanControl.VanControl.motorista.domain.dto.request.CadastrarMotoristaRequestDto;
import com.VanControl.VanControl.motorista.domain.dto.response.MotoristaDefaultResponseDto;
import com.VanControl.VanControl.motorista.domain.dto.response.MotoristaResponseDto;
import com.VanControl.VanControl.motorista.service.MotoristaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/motoristas")
@RequiredArgsConstructor
public class MotoristaController {

    private final MotoristaService motoristaService;

    @PostMapping
    public ResponseEntity<MotoristaDefaultResponseDto> cadastrarMotorista(@RequestBody @Valid CadastrarMotoristaRequestDto dto) {
        return new ResponseEntity<>(motoristaService.cadastrarMotorista(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<MotoristaResponseDto> buscarMotoristaPorCpf(@PathVariable String cpf) {
        return new ResponseEntity<>(motoristaService.buscarMotoristaPorCpf(cpf), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<MotoristaResponseDto>> buscarTodosMotoristas() {
        return new ResponseEntity<>(motoristaService.buscarTodosMotoristas(), HttpStatus.OK);
    }

    @PutMapping
    public ResponseEntity<MotoristaDefaultResponseDto> atualizarTelefoneMotorista(@RequestBody @Valid AtualizarTelefoneMotoristaRequestDto dto) {
        return new ResponseEntity<>(motoristaService.atualizarTelefoneMotorista(dto), HttpStatus.OK);
    }

    @DeleteMapping()
    public ResponseEntity<MotoristaDefaultResponseDto> deletarMotorista(@RequestParam String cpf) {
        return new ResponseEntity<>(motoristaService.deletarMotorista(cpf), HttpStatus.OK);
    }
}
