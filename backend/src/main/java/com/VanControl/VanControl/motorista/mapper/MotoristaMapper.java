package com.VanControl.VanControl.motorista.mapper;

import com.VanControl.VanControl.motorista.domain.dto.request.CadastrarMotoristaRequestDto;
import com.VanControl.VanControl.motorista.domain.dto.response.AdminMotoristaResponseDto;
import com.VanControl.VanControl.motorista.domain.dto.response.MotoristaResponseDto;
import com.VanControl.VanControl.motorista.domain.entity.Motorista;

public class MotoristaMapper {

    public static Motorista converterParaMotorista(CadastrarMotoristaRequestDto dto) {
        return new Motorista(
                dto.nome(),
                dto.cnh(),
                dto.categoriaCnh(),
                dto.dataValidadeCnh(),
                dto.cpf(),
                dto.telefone()
        );
    }

    public static MotoristaResponseDto converterParaMotoristaDto(Motorista motorista) {
        return new MotoristaResponseDto(
                motorista.getNome(),
                motorista.getCnh(),
                motorista.getCategoriaCnh(),
                motorista.getDataValidadeCnh(),
                motorista.getTelefone()
        );
    }

    public static AdminMotoristaResponseDto converterParaAdminMotoristaDto(Motorista motorista) {
        return new AdminMotoristaResponseDto(
                motorista.getId(),
                motorista.getNome(),
                motorista.getCnh(),
                motorista.getCategoriaCnh(),
                motorista.getDataValidadeCnh(),
                motorista.getCpf(),
                motorista.getTelefone()
        );
    }
}
