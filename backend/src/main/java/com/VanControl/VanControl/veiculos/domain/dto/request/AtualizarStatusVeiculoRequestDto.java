package com.VanControl.VanControl.veiculos.domain.dto.request;

import com.VanControl.VanControl.veiculos.domain.enums.StatusEnum;

public record AtualizarStatusVeiculoRequestDto(
        String placa,
        String status
) {
}
