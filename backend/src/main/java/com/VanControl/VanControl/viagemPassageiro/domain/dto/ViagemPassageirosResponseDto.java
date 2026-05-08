package com.VanControl.VanControl.viagemPassageiro.domain.dto;

import com.VanControl.VanControl.passageiros.domain.dto.response.PassageiroResumoResponseDto;

import java.util.List;

public record ViagemPassageirosResponseDto(
        String codigoViagem,
        int capacidade,
        long ocupacao,
        List<PassageiroResumoResponseDto> passageiros
) {
}
