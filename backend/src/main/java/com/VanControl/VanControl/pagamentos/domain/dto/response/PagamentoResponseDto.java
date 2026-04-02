package com.VanControl.VanControl.pagamentos.domain.dto.response;

import com.VanControl.VanControl.pagamentos.domain.enums.StatusPagamento;
import com.VanControl.VanControl.passageiros.domain.entity.Passageiro;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PagamentoResponseDto(
        @JsonFormat(pattern = "MM/yyyy")
        String competencia,
        BigDecimal valor,
        LocalDate dataVencimento,
        LocalDate dataPagamento,
        StatusPagamento status

) {
}
