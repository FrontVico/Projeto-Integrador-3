package com.VanControl.VanControl.pagamentos.controller;

import com.VanControl.VanControl.pagamentos.domain.dto.request.AtualizarStatusPagamentoRequestDto;
import com.VanControl.VanControl.pagamentos.domain.dto.request.CadastrarPagamentoRequestDto;
import com.VanControl.VanControl.pagamentos.domain.dto.response.PagamentoDefaultResponseDto;
import com.VanControl.VanControl.pagamentos.domain.dto.response.PagamentoResponseDto;
import com.VanControl.VanControl.pagamentos.service.PagamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.awt.*;
import java.util.UUID;

@RestController
@RequestMapping("/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService pagamentoService;

    @PostMapping
    public ResponseEntity<PagamentoDefaultResponseDto> cadastroPagamento(@RequestBody @Valid CadastrarPagamentoRequestDto dto){
       return new ResponseEntity<>(pagamentoService.cadastrarPagamento(dto), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PagamentoDefaultResponseDto> atualizarStatusPagamento(@PathVariable UUID id, @RequestBody @Valid AtualizarStatusPagamentoRequestDto dto){
        return new ResponseEntity<>(pagamentoService.atualizarStatusPagamento(id,dto),HttpStatus.OK);
    }

    @GetMapping("/passageiro/{id}")
    public ResponseEntity<List<PagamentoResponseDto>> buscarPagamentoPorId(@PathVariable UUID id){
        List<PagamentoResponseDto> pagamentos = pagamentoService.buscarPagamentoPorID(id);

        return ResponseEntity.status(HttpStatus.OK).body(pagamentos);

    }

}
