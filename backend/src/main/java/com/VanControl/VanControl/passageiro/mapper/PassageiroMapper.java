package com.VanControl.VanControl.passageiro.mapper;

import com.VanControl.VanControl.passageiro.domain.dto.response.PassageiroResponseAdminDto;
import com.VanControl.VanControl.passageiro.domain.dto.response.PassageiroResponseDto;
import com.VanControl.VanControl.passageiro.domain.entity.Passageiro;
import com.VanControl.VanControl.user.domain.dto.request.RegisterRequestDTO;

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
