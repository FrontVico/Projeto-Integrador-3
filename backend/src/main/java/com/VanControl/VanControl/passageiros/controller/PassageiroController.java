package com.VanControl.VanControl.passageiros.controller;

import com.VanControl.VanControl.passageiros.domain.dto.request.AtualizarPassageiroRequestDto;
import com.VanControl.VanControl.passageiros.domain.dto.response.PassageiroDefaultResponseDto;
import com.VanControl.VanControl.passageiros.domain.dto.response.PassageiroResponseDto;
import com.VanControl.VanControl.passageiros.service.PassageiroService;
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
@RequestMapping("/passageiros")
@RequiredArgsConstructor
@Tag(name = "Passageiros", description = "Operacoes relacionadas a passageiros")
@SecurityRequirement(name = "bearerAuth")
public class PassageiroController {

    private final PassageiroService passageiroService;

    @GetMapping("/{cpf}")
    @Operation(
            summary = "Buscar passageiro por CPF",
            description = "Entrada: cpf (path). Saida: PassageiroResponseDto (nome, cpf, telefone, email, intituicaoEnsino, turno, endereco, cep)."
    )
    public ResponseEntity<PassageiroResponseDto> buscarPassageiroPorCpf(@PathVariable String cpf) {
        return new ResponseEntity<>(passageiroService.buscarPassageiroPorCpf(cpf), HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MOTORISTA')")
    @Operation(
            summary = "Listar passageiros",
            description = "Saida: lista de PassageiroResponseDto (nome, cpf, telefone, email, intituicaoEnsino, turno, endereco, cep)."
    )
    public ResponseEntity<List<PassageiroResponseDto>> buscarTodosPassageiros() {
        return new ResponseEntity<>(passageiroService.listarPassageiros(), HttpStatus.OK);
    }

    @PutMapping("/{cpf}")
    @PreAuthorize("hasAnyRole('ADMIN','PASSAGEIRO')")
    @Operation(
            summary = "Atualizar passageiro",
            description = "Entrada: cpf (path) e AtualizarPassageiroRequestDto (nome, telefone, email, intituicaoEnsino, turno, Endereco, cep). Saida: PassageiroResponseDto."
    )
    public ResponseEntity<PassageiroResponseDto> atualizarPassageiro(@PathVariable String cpf, @RequestBody @Valid AtualizarPassageiroRequestDto dto) {
        return new ResponseEntity<>(passageiroService.atualizarPassageiro(cpf, dto), HttpStatus.OK);
    }

    @DeleteMapping("/{cpf}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Deletar passageiro",
            description = "Entrada: cpf (path). Saida: PassageiroDefaultResponseDto com mensagem."
    )
    public ResponseEntity<PassageiroDefaultResponseDto> deletarPassageiro(@PathVariable String cpf) {
        return new ResponseEntity<>(passageiroService.deletarPassageiro(cpf), HttpStatus.NO_CONTENT);
    }
}
