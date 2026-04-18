package com.VanControl.VanControl.viagem.domain.dto.response;

public record ViagemResponseDto(
        String codigoRota,
        String placaVeiculo,
        String cpfMotorista,
        String dataViagem,
        String horarioSaidaPrevisto,
        String horarioChegadaPrevisto,
        boolean viagemConcuida
) {
}
