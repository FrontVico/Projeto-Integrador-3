package com.VanControl.VanControl.veiculos.controller;

import com.VanControl.VanControl.veiculos.domain.dto.request.AtualizarStatusVeiculoRequestDto;
import com.VanControl.VanControl.veiculos.domain.dto.request.CadastrarVeiculoRequestDto;
import com.VanControl.VanControl.veiculos.domain.dto.response.VeiculoDefaultResponseDto;
import com.VanControl.VanControl.veiculos.domain.dto.response.VeiculoResponseDto;
import com.VanControl.VanControl.veiculos.service.VeiculoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/veiculos")
@RequiredArgsConstructor
public class VeiculoController {

    private final VeiculoService veiculoService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VeiculoDefaultResponseDto> cadastrarVeiculo(@RequestBody @Valid CadastrarVeiculoRequestDto dto) {
        return new ResponseEntity<>(veiculoService.cadastrarVeiculo(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{placa}")
    public ResponseEntity<VeiculoResponseDto> buscarVeiculoPorPlaca(@PathVariable String placa) {
        return new ResponseEntity<>(veiculoService.buscarVeiculoPorPlaca(placa), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<VeiculoResponseDto>> listarVeiculos() {
        return new ResponseEntity<>(veiculoService.listarVeiculos(), HttpStatus.OK);
    }

    @PutMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VeiculoDefaultResponseDto> atualizarStatusVeiculo(@RequestBody @Valid AtualizarStatusVeiculoRequestDto dto) {
        return new ResponseEntity<>(veiculoService.atualizarStatusVeiculo(dto), HttpStatus.OK);
    }

    @DeleteMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VeiculoDefaultResponseDto> deletarVeiculo(@RequestParam String placa) {
        return new ResponseEntity<>(veiculoService.deletarVeiculo(placa), HttpStatus.OK);
    }
}
