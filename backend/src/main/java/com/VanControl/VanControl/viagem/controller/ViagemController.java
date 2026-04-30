package com.VanControl.VanControl.viagem.controller;

import com.VanControl.VanControl.viagem.domain.dto.request.CriarViagemRequestDto;
import com.VanControl.VanControl.viagem.domain.dto.response.ViagemDefaultResponseDto;
import com.VanControl.VanControl.viagem.domain.dto.response.ViagemResponseDto;
import com.VanControl.VanControl.viagem.service.ViagemService;
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
@RequestMapping("/viagens")
@RequiredArgsConstructor
@Tag(name = "Viagens", description = "Operacoes relacionadas a viagens")
@SecurityRequirement(name = "bearerAuth")
public class ViagemController {

    private final ViagemService viagemService;

    @PostMapping
    @Operation(
            summary = "Cadastrar viagem",
            description = "Entrada: CriarViagemRequestDto (codigoRota, placaVeiculo, cpfMotorista, dataViagem, horarioSaidaPrevisto, horarioChegadaPrevisto). Saida: ViagemDefaultResponseDto com mensagem."
    )
    public ResponseEntity<ViagemDefaultResponseDto> cadastrarViagem(@RequestBody @Valid CriarViagemRequestDto dto) {
        return new ResponseEntity<>(viagemService.cadastrarViagem(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{codigo}")
    @Operation(
            summary = "Buscar viagem por codigo",
            description = "Entrada: codigo (path). Saida: ViagemResponseDto (codigoRota, placaVeiculo, cpfMotorista, dataViagem, horarioSaidaPrevisto, horarioChegadaPrevisto, viagemConcuida)."
    )
    public ResponseEntity<ViagemResponseDto> buscarViagemPorCodigo(@PathVariable String codigo) {
        return new ResponseEntity<>(viagemService.buscarViagemPorCodigo(codigo), HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Listar todas as viagens",
            description = "Saida: lista de ViagemResponseDto (codigoRota, placaVeiculo, cpfMotorista, dataViagem, horarioSaidaPrevisto, horarioChegadaPrevisto, viagemConcuida)."
    )
    public ResponseEntity<List<ViagemResponseDto>> listarTodasViagens() {
        return new ResponseEntity<>(viagemService.listarTodasViagens(), HttpStatus.OK);
    }

    @PutMapping("/{codigo}")
    @Operation(
            summary = "Atualizar status da viagem",
            description = "Entrada: codigo (path). Saida: ViagemDefaultResponseDto com mensagem."
    )
    public ResponseEntity<ViagemDefaultResponseDto> atualizarStatusViagem(@PathVariable String codigo) {
        return new ResponseEntity<>(viagemService.atualizarStatusViagem(codigo), HttpStatus.OK);
    }

    @DeleteMapping("/{codigo}")
    @Operation(
            summary = "Deletar viagem",
            description = "Entrada: codigo (path). Saida: ViagemDefaultResponseDto com mensagem."
    )
    public ResponseEntity<ViagemDefaultResponseDto> deletarViagem(@PathVariable String codigo) {
        return new ResponseEntity<>(viagemService.deletarViagem(codigo), HttpStatus.OK);
    }
}
