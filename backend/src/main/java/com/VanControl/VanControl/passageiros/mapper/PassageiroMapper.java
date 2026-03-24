package com.VanControl.VanControl.passageiros.mapper;

import com.VanControl.VanControl.passageiros.domain.dto.response.PassageiroResponseAdminDto;
import com.VanControl.VanControl.passageiros.domain.dto.response.PassageiroResponseDto;
import com.VanControl.VanControl.passageiros.domain.entity.Passageiro;
import com.VanControl.VanControl.user.DTO.RegisterRequestDTO;

public class PassageiroMapper {

    public static Passageiro converterParaPassageiro(RegisterRequestDTO dto) {
        return new Passageiro(
                dto.name(),
                dto.cpf(),
                dto.telefone(),
                dto.email(),
                dto.instituicaoEnsino(),
                dto.turno(),
                dto.endereco(),
                dto.cep()
        );
    }

    public static PassageiroResponseDto converterParaPassageiroResponseDto(Passageiro passageiro) {
        return new PassageiroResponseDto(
                passageiro.getNome(),
                passageiro.getCpf(),
                passageiro.getTelefone(),
                passageiro.getEmail(),
                passageiro.getInstituicaoEnsino(),
                passageiro.getTurno(),
                passageiro.getEndereco(),
                passageiro.getCep()
        );
    }

    public static PassageiroResponseAdminDto converterParaPassageiroResponseAdminDto(Passageiro passageiro) {
        return new PassageiroResponseAdminDto(
                passageiro.getId(),
                passageiro.getNome(),
                passageiro.getCpf(),
                passageiro.getTelefone(),
                passageiro.getEmail(),
                passageiro.getInstituicaoEnsino(),
                passageiro.getTurno(),
                passageiro.getEndereco(),
                passageiro.getCep()
        );
    }
}
