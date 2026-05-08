package com.VanControl.VanControl.viagem.domain.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CriarViagemRequestDto(
        @NotBlank String codigoRota,
        @NotBlank String placaVeiculo,
        @NotBlank String cpfMotorista,
        @NotBlank String dataViagem,
        @NotBlank String horarioSaidaPrevisto,
        @NotBlank String horarioChegadaPrevisto
) {
}
