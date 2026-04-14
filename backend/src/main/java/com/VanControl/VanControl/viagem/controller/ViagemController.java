package com.VanControl.VanControl.viagem.controller;

import com.VanControl.VanControl.viagem.domain.dto.request.CriarViagemRequestDto;
import com.VanControl.VanControl.viagem.domain.dto.response.ViagemDefaultResponseDto;
import com.VanControl.VanControl.viagem.domain.dto.response.ViagemResponseDto;
import com.VanControl.VanControl.viagem.service.ViagemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/viagens")
@RequiredArgsConstructor
public class ViagemController {

    private final ViagemService viagemService;

    @PostMapping
    public ResponseEntity<ViagemDefaultResponseDto> cadastrarViagem(@RequestBody @Valid CriarViagemRequestDto dto) {
        return new ResponseEntity<>(viagemService.cadastrarViagem(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{codigo}")
    public ResponseEntity<ViagemResponseDto> buscarViagemPorCodigo(@PathVariable String codigo) {
        return new ResponseEntity<>(viagemService.buscarViagemPorCodigo(codigo), HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ViagemResponseDto>> listarTodasViagens() {
        return new ResponseEntity<>(viagemService.listarTodasViagens(), HttpStatus.OK);
    }

    @PutMapping("/{codigo}")
    public ResponseEntity<ViagemDefaultResponseDto> atualizarStatusViagem(@PathVariable String codigo) {
        return new ResponseEntity<>(viagemService.atualizarStatusViagem(codigo), HttpStatus.OK);
    }

    @DeleteMapping("/{codigo}")
    public ResponseEntity<ViagemDefaultResponseDto> deletarViagem(@PathVariable String codigo) {
        return new ResponseEntity<>(viagemService.deletarViagem(codigo), HttpStatus.OK);
    }
}
