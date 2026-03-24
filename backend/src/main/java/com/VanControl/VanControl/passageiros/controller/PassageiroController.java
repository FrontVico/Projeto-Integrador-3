package com.VanControl.VanControl.passageiros.controller;

import com.VanControl.VanControl.passageiros.domain.dto.request.AtualizarPassageiroRequestDto;
import com.VanControl.VanControl.passageiros.domain.dto.response.PassageiroDefaultResponseDto;
import com.VanControl.VanControl.passageiros.domain.dto.response.PassageiroResponseDto;
import com.VanControl.VanControl.passageiros.service.PassageiroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/passageiros")
@RequiredArgsConstructor
public class PassageiroController {

    private final PassageiroService passageiroService;

    @GetMapping("/{cpf}")
    public ResponseEntity<PassageiroResponseDto> buscarPassageiroPorCpf(@PathVariable String cpf) {
        return new ResponseEntity<>(passageiroService.buscarPassageiroPorCpf(cpf), HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PassageiroResponseDto>> buscarTodosPassageiros() {
        return new ResponseEntity<>(passageiroService.listarPassageiros(), HttpStatus.OK);
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<PassageiroResponseDto> atualizarPassageiro(@PathVariable String cpf, @RequestBody @Valid AtualizarPassageiroRequestDto dto) {
        return new ResponseEntity<>(passageiroService.atualizarPassageiro(cpf, dto), HttpStatus.OK);
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<PassageiroDefaultResponseDto> deletarPassageiro(@PathVariable String cpf) {
        return new ResponseEntity<>(passageiroService.deletarPassageiro(cpf), HttpStatus.NO_CONTENT);
    }
}
