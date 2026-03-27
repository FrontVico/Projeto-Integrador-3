package com.VanControl.VanControl.veiculos.service;

import com.VanControl.VanControl.commons.exception.model.ConflictException;
import com.VanControl.VanControl.commons.exception.model.NotFoundException;
import com.VanControl.VanControl.veiculos.domain.dto.request.AtualizarStatusVeiculoRequestDto;
import com.VanControl.VanControl.veiculos.domain.dto.request.CadastrarVeiculoRequestDto;
import com.VanControl.VanControl.veiculos.domain.dto.response.VeiculoDefaultResponseDto;
import com.VanControl.VanControl.veiculos.domain.dto.response.VeiculoResponseDto;
import com.VanControl.VanControl.veiculos.domain.entity.Veiculo;
import com.VanControl.VanControl.veiculos.domain.enums.StatusEnum;
import com.VanControl.VanControl.veiculos.mapper.VeiculoMapper;
import com.VanControl.VanControl.veiculos.repository.VeiculoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VeiculoService {

    private final VeiculoRepository veiculoRepository;

    public VeiculoDefaultResponseDto cadastrarVeiculo(CadastrarVeiculoRequestDto dto) {
        if(veiculoRepository.findByPlaca(dto.placa()) != null){
            throw new ConflictException("Veículo já cadastrado");
        }

        var veiculo = VeiculoMapper.converterParaVeiculo(dto);

        veiculoRepository.save(veiculo);
        return new VeiculoDefaultResponseDto("Veículo cadastrado com sucesso");
    }

    public VeiculoResponseDto buscarVeiculoPorPlaca(String placa) {
        var veiculo = buscarVeiculoPorPlacaInterno(placa);
        return VeiculoMapper.converterParaVeiculoDto(veiculo);
    }

    public List<VeiculoResponseDto> listarVeiculos() {
        return veiculoRepository.findAll()
                .stream()
                .map(VeiculoMapper::converterParaVeiculoDto)
                .toList();
    }

    public VeiculoDefaultResponseDto atualizarStatusVeiculo(AtualizarStatusVeiculoRequestDto dto) {
        var veiculo = buscarVeiculoPorPlacaInterno(dto.placa());
        veiculo.setStatus(StatusEnum.valueOf(dto.status().toUpperCase()));
        veiculoRepository.save(veiculo);
        return new VeiculoDefaultResponseDto("Status do veículo atualizado com sucesso");
    }

    public VeiculoDefaultResponseDto deletarVeiculo(String placa) {
        var veiculo = buscarVeiculoPorPlacaInterno(placa);
        veiculoRepository.delete(veiculo);
        return new VeiculoDefaultResponseDto("Veículo deletado com sucesso");
    }

    private Veiculo buscarVeiculoPorPlacaInterno(String placa) {
        var veiculo = veiculoRepository.findByPlaca(placa);
        if(veiculo == null){
            throw new NotFoundException("Veículo não encontrado");
        }
        return veiculo;
    }
}
