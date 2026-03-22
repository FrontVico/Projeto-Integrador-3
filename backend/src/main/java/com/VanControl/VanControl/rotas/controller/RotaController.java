package com.VanControl.VanControl.rotas.controller;

import com.VanControl.VanControl.motorista.domain.dto.response.MotoristaResponseDto;
import com.VanControl.VanControl.rotas.domain.dto.request.AtualizarDescricaoRotaRequestDto;
import com.VanControl.VanControl.rotas.domain.dto.request.CadastrarRotaRequestDto;
import com.VanControl.VanControl.rotas.domain.dto.response.RotaDefaultResponseDto;
import com.VanControl.VanControl.rotas.domain.dto.response.RotaResponseDto;
import com.VanControl.VanControl.rotas.domain.entity.Rota;
import com.VanControl.VanControl.rotas.service.RotaService;
import jakarta.validation.Valid;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/rotas")
@RequiredArgsConstructor
public class RotaController {

    private final RotaService rotaService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RotaDefaultResponseDto> cadastrarRota(@RequestBody @Valid CadastrarRotaRequestDto dto) {
       return new ResponseEntity<>(rotaService.cadastrarRota(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{destino}")
    public ResponseEntity<List<RotaResponseDto>> buscarRotaPorDestino(@PathVariable String destino) {
        List<RotaResponseDto> rotas = rotaService.buscarRotaPorDestino(destino);
        return ResponseEntity.status(HttpStatus.OK).body(rotas);
    }

    @GetMapping
    public ResponseEntity<List<RotaResponseDto>> buscarTodasRotas(){
        return new ResponseEntity<>(rotaService.buscarTodasRotas(), HttpStatus.OK);
    }

    @PatchMapping("/{id}/descricao")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RotaDefaultResponseDto> atualizarDescricaoRota(@PathVariable UUID id, @RequestBody AtualizarDescricaoRotaRequestDto dto) {
        RotaDefaultResponseDto response = rotaService.atualizarDescricaoRota(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RotaDefaultResponseDto> deletarRota(@RequestParam UUID id) {
        return new ResponseEntity<>(rotaService.deletarRota(id), HttpStatus.OK);
    }

}
