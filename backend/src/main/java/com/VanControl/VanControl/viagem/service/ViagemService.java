package com.VanControl.VanControl.viagem.service;

import com.VanControl.VanControl.viagem.domain.dto.request.CriarViagemRequestDto;
import com.VanControl.VanControl.viagem.domain.dto.response.ViagemDefaultResponseDto;
import com.VanControl.VanControl.viagem.domain.dto.response.ViagemResponseDto;
import com.VanControl.VanControl.viagem.mapper.ViagemMapper;
import com.VanControl.VanControl.viagem.repository.ViagemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ViagemService {

    private final ViagemRepository viagemRepository;

    public ViagemDefaultResponseDto cadastrarViagem(CriarViagemRequestDto dto) {
        var viagem = ViagemMapper.converterParaViagem(dto);

        viagem.setCodigoViagem(
                "VIA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()
        );

        viagemRepository.save(viagem);
        return new ViagemDefaultResponseDto("Viagem cadastrada.");
    }

    public ViagemResponseDto buscarViagemPorCodigo(String codigo){
        return ViagemMapper.converterParaViagemDto(
                viagemRepository.findByCodigoViagem(codigo)
        );
    }

    public List<ViagemResponseDto> listarTodasViagens() {
        return viagemRepository.findAll().stream()
                .map(ViagemMapper::converterParaViagemDto)
                .toList();
    }

    public ViagemDefaultResponseDto atualizarStatusViagem(String codigo) {
        var viagem = viagemRepository.findByCodigoViagem(codigo);
        viagem.setViagemConcluida(true);
        viagemRepository.save(viagem);
        return new ViagemDefaultResponseDto("Status da viagem atualizado para concluída.");
    }

    public ViagemDefaultResponseDto deletarViagem(String codigo) {
        var viagem = viagemRepository.findByCodigoViagem(codigo);
        viagemRepository.delete(viagem);
        return new ViagemDefaultResponseDto("Viagem deletada.");
    }
}
