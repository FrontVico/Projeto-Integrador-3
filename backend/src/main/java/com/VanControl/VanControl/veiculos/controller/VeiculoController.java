package com.VanControl.VanControl.veiculos.controller;

import com.VanControl.VanControl.veiculos.domain.dto.request.AtualizarStatusVeiculoRequestDto;
import com.VanControl.VanControl.veiculos.domain.dto.request.CadastrarVeiculoRequestDto;
import com.VanControl.VanControl.veiculos.domain.dto.response.VeiculoDefaultResponseDto;
import com.VanControl.VanControl.veiculos.domain.dto.response.VeiculoResponseDto;
import com.VanControl.VanControl.veiculos.service.VeiculoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Veiculos", description = "Operacoes relacionadas a veiculos")
@SecurityRequirement(name = "bearerAuth")
public class VeiculoController {

    private final VeiculoService veiculoService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Cadastrar veiculo",
            description = "Entrada: CadastrarVeiculoRequestDto (placa, marca, modelo, ano, capacidade, renavam, status). Saida: VeiculoDefaultResponseDto com mensagem."
    )
    public ResponseEntity<VeiculoDefaultResponseDto> cadastrarVeiculo(@RequestBody @Valid CadastrarVeiculoRequestDto dto) {
        return new ResponseEntity<>(veiculoService.cadastrarVeiculo(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{placa}")
    @Operation(
            summary = "Buscar veiculo por placa",
            description = "Entrada: placa (path). Saida: VeiculoResponseDto (placa, marca, modelo, ano, capacidade, status)."
    )
    public ResponseEntity<VeiculoResponseDto> buscarVeiculoPorPlaca(@PathVariable String placa) {
        return new ResponseEntity<>(veiculoService.buscarVeiculoPorPlaca(placa), HttpStatus.OK);
    }

    @GetMapping
    @Operation(
            summary = "Listar veiculos",
            description = "Saida: lista de VeiculoResponseDto (placa, marca, modelo, ano, capacidade, status)."
    )
    public ResponseEntity<List<VeiculoResponseDto>> listarVeiculos() {
        return new ResponseEntity<>(veiculoService.listarVeiculos(), HttpStatus.OK);
    }

    @PutMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Atualizar status do veiculo",
            description = "Entrada: AtualizarStatusVeiculoRequestDto (placa, status). Saida: VeiculoDefaultResponseDto com mensagem."
    )
    public ResponseEntity<VeiculoDefaultResponseDto> atualizarStatusVeiculo(@RequestBody @Valid AtualizarStatusVeiculoRequestDto dto) {
        return new ResponseEntity<>(veiculoService.atualizarStatusVeiculo(dto), HttpStatus.OK);
    }

    @DeleteMapping()
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Deletar veiculo",
            description = "Entrada: placa (query). Saida: VeiculoDefaultResponseDto com mensagem."
    )
    public ResponseEntity<VeiculoDefaultResponseDto> deletarVeiculo(@RequestParam String placa) {
        return new ResponseEntity<>(veiculoService.deletarVeiculo(placa), HttpStatus.OK);
    }
}
