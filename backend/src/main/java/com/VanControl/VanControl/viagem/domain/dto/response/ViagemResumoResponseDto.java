package com.VanControl.VanControl.viagem.domain.dto.response;

public record ViagemResumoResponseDto(
        String codigoViagem,
        String codigoRota,
        String placaVeiculo,
        String dataViagem,
        String horarioSaidaPrevisto,
        String horarioChegadaPrevisto,
        boolean viagemConcluida
) {
}
