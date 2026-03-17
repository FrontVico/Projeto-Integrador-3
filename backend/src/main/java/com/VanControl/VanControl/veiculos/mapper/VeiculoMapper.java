package com.VanControl.VanControl.veiculos.mapper;

import com.VanControl.VanControl.veiculos.domain.dto.request.CadastrarVeiculoRequestDto;
import com.VanControl.VanControl.veiculos.domain.dto.response.VeiculoResponseDto;
import com.VanControl.VanControl.veiculos.domain.entity.Veiculo;

public class VeiculoMapper {

    public static Veiculo converterParaVeiculo(CadastrarVeiculoRequestDto dto) {
        return new Veiculo(
                dto.placa(),
                dto.marca(),
                dto.modelo(),
                dto.ano(),
                dto.capacidade(),
                dto.renavam(),
                dto.status().toUpperCase()
        );
    }

    public static VeiculoResponseDto converterParaVeiculoDto(Veiculo veiculo) {
        return new VeiculoResponseDto(
                veiculo.getPlaca(),
                veiculo.getMarca(),
                veiculo.getModelo(),
                veiculo.getAno(),
                veiculo.getCapacidade(),
                veiculo.getRenavam(),
                veiculo.getStatus()
        );
    }
}
