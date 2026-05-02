package com.VanControl.VanControl.pagamentos.controller;

import com.VanControl.VanControl.commons.util.SecurityUtils;
import com.VanControl.VanControl.pagamentos.domain.dto.request.AtualizarStatusPagamentoRequestDto;
import com.VanControl.VanControl.pagamentos.domain.dto.request.CadastrarPagamentoRequestDto;
import com.VanControl.VanControl.pagamentos.domain.dto.response.PagamentoDefaultResponseDto;
import com.VanControl.VanControl.pagamentos.domain.dto.response.PagamentoResponseDto;
import com.VanControl.VanControl.pagamentos.service.PagamentoService;
import com.VanControl.VanControl.user.Model.User.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Pagamentos", description = "Operacoes relacionadas a pagamentos")
@SecurityRequirement(name = "bearerAuth")
public class PagamentoController {

    private final PagamentoService pagamentoService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MOTORISTA')")
    @Operation(
            summary = "Cadastrar pagamento",
            description = "Entrada: CadastrarPagamentoRequestDto (cpf, competencia, valor, dataVencimento). Saida: PagamentoDefaultResponseDto com mensagem."
    )
    public ResponseEntity<PagamentoDefaultResponseDto> cadastroPagamento(@RequestBody @Valid CadastrarPagamentoRequestDto dto){
       return new ResponseEntity<>(pagamentoService.cadastrarPagamento(dto), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MOTORISTA')")
    @Operation(
            summary = "Atualizar status do pagamento",
            description = "Entrada: id (path) e AtualizarStatusPagamentoRequestDto (status, dataPagamento). Saida: PagamentoDefaultResponseDto com mensagem."
    )
    public ResponseEntity<PagamentoDefaultResponseDto> atualizarStatusPagamento(@PathVariable UUID id, @RequestBody @Valid AtualizarStatusPagamentoRequestDto dto){
        return new ResponseEntity<>(pagamentoService.atualizarStatusPagamento(id,dto),HttpStatus.OK);
    }

    @GetMapping("/passageiro/{cpf}")
    @PreAuthorize("hasAnyRole('ADMIN','MOTORISTA','PASSAGEIRO')")
    @Operation(
            summary = "Listar pagamentos do passageiro",
            description = "Entrada: cpf do passageiro (path). Saida: lista de PagamentoResponseDto (nome, competencia, valor, dataVencimento, dataPagamento, status)."
    )
    public ResponseEntity<List<PagamentoResponseDto>> buscarPagamentosDoPassageiroPorCpf(@PathVariable String cpf){
        securityUtils.validateCpfAccess(cpf);
        List<PagamentoResponseDto> pagamentos = pagamentoService.buscarPagamentosDoPassageiroPorCpf(cpf);

        return ResponseEntity.status(HttpStatus.OK).body(pagamentos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MOTORISTA')")
    @Operation(
            summary = "Buscar pagamento por ID",
            description = "Entrada: id (path). Saida: PagamentoResponseDto (nome, competencia, valor, dataVencimento, dataPagamento, status)."
    )
    public ResponseEntity<PagamentoResponseDto> buscarPagamentoEspecificoPorID(@PathVariable UUID id){
        return new ResponseEntity<>(pagamentoService.buscarPagamentoEspecificoPorID(id),HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MOTORISTA')")
    @Operation(
            summary = "Buscar pagamentos por competencia",
            description = "Entrada: competencia (query, formato MM/yyyy). Saida: lista de PagamentoResponseDto (nome, competencia, valor, dataVencimento, dataPagamento, status)."
    )
    public ResponseEntity<List<PagamentoResponseDto>> buscarPagamentosPorCompetencia(@RequestParam String competencia){
        return new ResponseEntity<>(pagamentoService.buscarPagamentosPorCompetencia(competencia),HttpStatus.OK);
    }

    @GetMapping("/meus-pagamentos")
    @PreAuthorize("hasRole('PASSAGEIRO')")
    @Operation(
            summary = "Listar meus pagamentos",
            description = "Saida: lista de PagamentoResponseDto (nome, competencia, valor, dataVencimento, dataPagamento, status) do usuario autenticado."
    )
    public ResponseEntity<List<PagamentoResponseDto>> buscarMeusPagamentos(){
        User userLogged = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        List<PagamentoResponseDto> pagamentos = pagamentoService.buscarMeusPagamentos(userLogged.getId());

        return ResponseEntity.status(HttpStatus.OK).body(pagamentos);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Deletar pagamento",
            description = "Entrada: id (path). Saida: PagamentoDefaultResponseDto com mensagem."
    )
    public ResponseEntity<PagamentoDefaultResponseDto> deletarPagamento(@PathVariable UUID id){
        return new ResponseEntity<>(pagamentoService.deletarPagamento(id),HttpStatus.OK);
    }

}
