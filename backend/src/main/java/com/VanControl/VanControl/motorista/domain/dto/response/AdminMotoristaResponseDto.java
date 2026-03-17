package com.VanControl.VanControl.motorista.domain.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.YearMonth;
import java.util.UUID;

public record AdminMotoristaResponseDto(
        UUID id,
        String nome,
        String cnh,
        String categoriaCnh,
        @JsonFormat(pattern = "MM/yyyy")
        YearMonth dataValidadeCnh,
        String cpf,
        String telefone
) {
}
