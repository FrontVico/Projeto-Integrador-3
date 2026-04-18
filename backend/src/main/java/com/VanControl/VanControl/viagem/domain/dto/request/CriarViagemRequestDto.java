package com.VanControl.VanControl.viagem.domain.dto.request;

public record CriarViagemRequestDto(
        String codigoRota,
        String placaVeiculo,
        String cpfMotorista,
        String dataViagem,
        String horarioSaidaPrevisto,
        String horarioChegadaPrevisto
) {
}
