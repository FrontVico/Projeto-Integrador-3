package com.VanControl.VanControl.motorista.service;

import com.VanControl.VanControl.commons.exception.model.ConflictException;
import com.VanControl.VanControl.commons.exception.model.NotFoundException;
import com.VanControl.VanControl.motorista.domain.dto.request.AtualizarTelefoneMotoristaRequestDto;
import com.VanControl.VanControl.motorista.domain.dto.request.CadastrarMotoristaRequestDto;
import com.VanControl.VanControl.motorista.domain.dto.response.MotoristaDefaultResponseDto;
import com.VanControl.VanControl.motorista.domain.dto.response.MotoristaResponseDto;
import com.VanControl.VanControl.motorista.domain.entity.Motorista;
import com.VanControl.VanControl.motorista.mapper.MotoristaMapper;
import com.VanControl.VanControl.motorista.repository.MotoristaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MotoristaService {

    private final MotoristaRepository motoristaRepository;

    public MotoristaDefaultResponseDto cadastrarMotorista(CadastrarMotoristaRequestDto dto) {
        if(motoristaRepository.findByCpf(dto.cpf()) != null){
            throw new ConflictException("Motorista já cadastrado");
        }

        var motorista = MotoristaMapper.converterParaMotorista(dto);

        motoristaRepository.save(motorista);
        return new MotoristaDefaultResponseDto("Motorista cadastrado com sucesso");
    }

    public MotoristaResponseDto buscarMotoristaPorCpf(String cpf) {
        var motorista = buscarMotoristaPorCpfInterno(cpf);
        return MotoristaMapper.converterParaMotoristaDto(motorista);
    }

    public List<MotoristaResponseDto> buscarTodosMotoristas() {
        return motoristaRepository.findAll()
                .stream()
                .map(MotoristaMapper::converterParaMotoristaDto)
                .toList();
    }

    public MotoristaDefaultResponseDto atualizarTelefoneMotorista(AtualizarTelefoneMotoristaRequestDto dto) {
        var motorista = buscarMotoristaPorCpfInterno(dto.cpf());
        motorista.setTelefone(dto.novoTelefone());
        motoristaRepository.save(motorista);
        return new MotoristaDefaultResponseDto("Telefone do motorista atualizado com sucesso");
    }

    @Transactional
    public MotoristaDefaultResponseDto deletarMotorista(String cpf) {
        var motorista = buscarMotoristaPorCpfInterno(cpf);
        motoristaRepository.delete(motorista);
        return new MotoristaDefaultResponseDto("Motorista deletado com sucesso");
    }

    private Motorista buscarMotoristaPorCpfInterno(String cpf) {
        var motorista = motoristaRepository.findByCpf(cpf);
        if(motorista == null){
            throw new NotFoundException("Motorista não encontrado");
        }
        return motorista;
    }
}
