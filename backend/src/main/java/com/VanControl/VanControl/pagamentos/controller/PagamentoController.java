package com.VanControl.VanControl.pagamentos.controller;

import com.VanControl.VanControl.pagamentos.domain.dto.request.CadastrarPagamentoRequestDto;
import com.VanControl.VanControl.pagamentos.domain.dto.response.PagamentoDefaultResponseDto;
import com.VanControl.VanControl.pagamentos.service.PagamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService pagamentoService;

    @PostMapping
    public ResponseEntity<PagamentoDefaultResponseDto> cadastroPagamento(@RequestBody @Valid CadastrarPagamentoRequestDto dto){
       return new ResponseEntity<>(pagamentoService.cadastrarPagamento(dto), HttpStatus.CREATED);
    }

}
