package com.VanControl.VanControl.veiculos.service;

import com.VanControl.VanControl.veiculos.domain.dto.request.AtualizarStatusVeiculoRequestDto;
import com.VanControl.VanControl.veiculos.domain.dto.request.CadastrarVeiculoRequestDto;
import com.VanControl.VanControl.veiculos.domain.dto.response.ResponseDto;
import com.VanControl.VanControl.veiculos.domain.dto.response.VeiculoResponseDto;
import com.VanControl.VanControl.veiculos.domain.enums.StatusEnum;
import com.VanControl.VanControl.veiculos.mapper.VeiculoMapper;
import com.VanControl.VanControl.veiculos.repository.VeiculoRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VeiculoService {

    private final VeiculoRepository veiculoRepository;

    public ResponseDto cadastrarVeiculo(CadastrarVeiculoRequestDto dto) {
        if(veiculoRepository.findByPlaca(dto.placa()) != null){
            throw new RuntimeException("Veículo já cadastrado");
        }

        var veiculo = VeiculoMapper.converterParaVeiculo(dto);

        veiculoRepository.save(veiculo);
        return new ResponseDto("Veículo cadastrado com sucesso");
    }

    public VeiculoResponseDto buscarVeiculoPorPlaca(String placa) {
        var veiculo = veiculoRepository.findByPlaca(placa);
        if(veiculo == null){
            throw new RuntimeException("Veículo não encontrado");
        }
        return VeiculoMapper.converterParaVeiculoDto(veiculo);
    }

    public List<VeiculoResponseDto> listarVeiculos() {
        return veiculoRepository.findAll()
                .stream()
                .map(VeiculoMapper::converterParaVeiculoDto)
                .toList();
    }

    public ResponseDto atualizarStatusVeiculo(@Valid AtualizarStatusVeiculoRequestDto dto) {
        var veiculo = veiculoRepository.findByPlaca(dto.placa());
        if(veiculo == null){
            throw new RuntimeException("Veículo não encontrado");
        }
        veiculo.setStatus(StatusEnum.valueOf(dto.status().toUpperCase()));
        veiculoRepository.save(veiculo);
        return new ResponseDto("Status do veículo atualizado com sucesso");
    }

    public ResponseDto deletarVeiculo(String placa) {
        var veiculo = veiculoRepository.findByPlaca(placa);
        if(veiculo == null){
            throw new RuntimeException("Veículo não encontrado");
        }
        veiculoRepository.delete(veiculo);
        return new ResponseDto("Veículo deletado com sucesso");
    }
}
