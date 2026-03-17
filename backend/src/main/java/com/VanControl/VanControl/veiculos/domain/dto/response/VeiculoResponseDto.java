package com.VanControl.VanControl.veiculos.domain.dto.response;

public record VeiculoResponseDto(
        String placa,
        String marca,
        String modelo,
        int ano,
        int capacidade,
        String renavam,
        String status
) {
}
