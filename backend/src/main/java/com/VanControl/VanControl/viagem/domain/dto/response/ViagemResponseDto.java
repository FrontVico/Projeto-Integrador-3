package com.VanControl.VanControl.viagem.domain.dto.response;

import java.util.UUID;

public record ViagemResponseDto(
        UUID rotaId,
        UUID veiculoId,
        UUID motoristaId,
        String dataViagem,
        String horarioSaidaPrevisto,
        String horarioChegadaPrevisto,
        boolean viagemConcuida
) {
}
