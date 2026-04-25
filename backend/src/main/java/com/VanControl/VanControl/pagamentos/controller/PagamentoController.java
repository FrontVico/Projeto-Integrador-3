package com.VanControl.VanControl.pagamentos.controller;

import com.VanControl.VanControl.pagamentos.domain.dto.request.AtualizarStatusPagamentoRequestDto;
import com.VanControl.VanControl.pagamentos.domain.dto.request.CadastrarPagamentoRequestDto;
import com.VanControl.VanControl.pagamentos.domain.dto.response.PagamentoDefaultResponseDto;
import com.VanControl.VanControl.pagamentos.domain.dto.response.PagamentoResponseDto;
import com.VanControl.VanControl.pagamentos.service.PagamentoService;
import com.VanControl.VanControl.user.Model.User.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService pagamentoService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MOTORISTA')")
    public ResponseEntity<PagamentoDefaultResponseDto> cadastroPagamento(@RequestBody @Valid CadastrarPagamentoRequestDto dto){
       return new ResponseEntity<>(pagamentoService.cadastrarPagamento(dto), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MOTORISTA')")
    public ResponseEntity<PagamentoDefaultResponseDto> atualizarStatusPagamento(@PathVariable UUID id, @RequestBody @Valid AtualizarStatusPagamentoRequestDto dto){
        return new ResponseEntity<>(pagamentoService.atualizarStatusPagamento(id,dto),HttpStatus.OK);
    }

    @GetMapping("/passageiro/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MOTORISTA')")
    public ResponseEntity<List<PagamentoResponseDto>> buscarPagamentosDoPassageiroPorId(@PathVariable UUID id){
        List<PagamentoResponseDto> pagamentos = pagamentoService.buscarPagamentosDoPassageiroPorID(id);

        return ResponseEntity.status(HttpStatus.OK).body(pagamentos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MOTORISTA')")
    public ResponseEntity<PagamentoResponseDto> buscarPagamentoEspecificoPorID(@PathVariable UUID id){
        return new ResponseEntity<>(pagamentoService.buscarPagamentoEspecificoPorID(id),HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MOTORISTA')")
    public ResponseEntity<List<PagamentoResponseDto>> buscarPagamentosPorCompetencia(@RequestParam String competencia){
        return new ResponseEntity<>(pagamentoService.buscarPagamentosPorCompetencia(competencia),HttpStatus.OK);
    }

    @GetMapping("/meus-pagamentos")
    @PreAuthorize("hasRole('PASSAGEIRO')")
    public ResponseEntity<List<PagamentoResponseDto>> buscarMeusPagamentos(){
        User userLogged = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        List<PagamentoResponseDto> pagamentos = pagamentoService.buscarMeusPagamentos(userLogged.getId());

        return ResponseEntity.status(HttpStatus.OK).body(pagamentos);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagamentoDefaultResponseDto> deletarPagamento(@PathVariable UUID id){
        return new ResponseEntity<>(pagamentoService.deletarPagamento(id),HttpStatus.OK);
    }

}
