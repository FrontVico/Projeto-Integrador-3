package com.VanControl.VanControl.viagem.mapper;

import com.VanControl.VanControl.viagem.domain.dto.request.CriarViagemRequestDto;
import com.VanControl.VanControl.viagem.domain.dto.response.ViagemResponseDto;
import com.VanControl.VanControl.viagem.domain.entity.Viagem;

public class ViagemMapper {

    public static Viagem converterParaViagem(CriarViagemRequestDto dto) {
        return new Viagem(
                dto.veiculoId(),
                dto.motoristaId(),
                dto.dataViagem(),
                dto.horarioSaidaPrevisto(),
                dto.horarioChegadaPrevisto()
        );
    }

    public static ViagemResponseDto converterParaViagemDto(Viagem viagem) {
        return new ViagemResponseDto(
                viagem.getRotaId(),
                viagem.getVeiculoId(),
                viagem.getMotoristaId(),
                viagem.getDataViagem(),
                viagem.getHorarioSaidaPrevisto(),
                viagem.getHorarioChegadaPrevisto(),
                viagem.isViagemConcluida()
        );
    }
}
