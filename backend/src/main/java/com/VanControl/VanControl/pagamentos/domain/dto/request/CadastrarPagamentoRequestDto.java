package com.VanControl.VanControl.pagamentos.domain.dto.request;

import com.VanControl.VanControl.pagamentos.domain.enums.StatusPagamento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CadastrarPagamentoRequestDto(

        @NotNull(message = "O ID do passageiro é obrigatório")
        UUID passageiroId,

        @Pattern(regexp = "^(0[1-9]|1[0-2])/\\d{4}$", message = "Insira a competência no formato (mês/ano)")
        @NotNull(message = "Insira a competencia do pagamento")
        String competencia,

        @NotNull(message = "O valor é obrigatório")
        @DecimalMin(value = "0.1", message = "O valor deve ser maior que zero")
        BigDecimal valor,

        @NotNull(message = "A data de vencimento é obrigatório")
        LocalDate dataVencimento
) {
}
