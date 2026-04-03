package com.VanControl.VanControl.pagamentos.service;

import com.VanControl.VanControl.commons.exception.model.ConflictException;
import com.VanControl.VanControl.commons.exception.model.NotFoundException;
import com.VanControl.VanControl.pagamentos.domain.dto.request.AtualizarStatusPagamentoRequestDto;
import com.VanControl.VanControl.pagamentos.domain.dto.request.CadastrarPagamentoRequestDto;
import com.VanControl.VanControl.pagamentos.domain.dto.response.PagamentoDefaultResponseDto;
import com.VanControl.VanControl.pagamentos.domain.dto.response.PagamentoResponseDto;
import com.VanControl.VanControl.pagamentos.domain.entity.Pagamento;
import com.VanControl.VanControl.pagamentos.domain.enums.StatusPagamento;
import com.VanControl.VanControl.pagamentos.mapper.PagamentoMapper;
import com.VanControl.VanControl.pagamentos.repository.PagamentoRepository;
import com.VanControl.VanControl.passageiros.domain.entity.Passageiro;
import com.VanControl.VanControl.passageiros.repository.PassageiroRepository;
import com.VanControl.VanControl.passageiros.service.PassageiroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static com.VanControl.VanControl.pagamentos.mapper.PagamentoMapper.converterParaPagamento;

@Service
@RequiredArgsConstructor
public class PagamentoService{

    private final PagamentoRepository pagamentoRepository;
    private final PassageiroRepository passageiroRepository;
    private final PassageiroService passageiroService;

    public PagamentoDefaultResponseDto cadastrarPagamento(CadastrarPagamentoRequestDto dto){
        if(pagamentoRepository.existsByPassageiroIdAndCompetencia(dto.passageiroId(), dto.competencia())){
            throw new ConflictException("Pagamento já cadastrado para o passageiro na competência: " + dto.competencia());
        }

        Passageiro passageiro = passageiroRepository.findById(dto.passageiroId())
                .orElseThrow(() -> new RuntimeException("Passageiro não encontrado"));

        var pagamento = PagamentoMapper.converterParaPagamento(dto, passageiro);
        pagamento.setStatus(StatusPagamento.PENDENTE);

        pagamentoRepository.save(pagamento);

        return new PagamentoDefaultResponseDto("Pagamento cadastrado com sucesso");
    }

    public PagamentoDefaultResponseDto atualizarStatusPagamento(UUID id, AtualizarStatusPagamentoRequestDto dto){

        Pagamento pagamento = pagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pagamento não encontrado"));

        pagamento.setStatus(StatusPagamento.valueOf(dto.status()));
        pagamento.setDataPagamento(dto.dataPagamento());

        pagamentoRepository.save(pagamento);

        return new PagamentoDefaultResponseDto("Status e data de pagamento atualizado com sucesso");
    }

    public List<PagamentoResponseDto> buscarPagamentosDoPassageiroPorID(UUID id){
        var pagamento = pagamentoRepository.findByPassageiroId(id);
        if(pagamento.isEmpty()){
            throw new NotFoundException("Passageiro não encontrado");
        }

        return pagamento.stream()
                .map(PagamentoMapper::converterParaPagamentoDto)
                .toList();
    }

    public PagamentoResponseDto buscarPagamentoEspecificoPorID(UUID id){
        Pagamento pagamento = pagamentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Pagamento não encontrado"));

        return  PagamentoMapper.converterParaPagamentoDto(pagamento);
    }

    public List<PagamentoResponseDto> buscarPagamentosPorCompetencia(String competencia){
        var pagamento = pagamentoRepository.findByCompetencia(competencia);
        if(pagamento.isEmpty()){
            throw new NotFoundException("Competencia não encontrado");
        }

        return pagamento.stream()
                .map(PagamentoMapper::converterParaPagamentoDto)
                .toList();

    }

    public List<PagamentoResponseDto> buscarMeusPagamentos(String user){

        Passageiro passageiro = passageiroRepository.findByUser_Id(user)
                .orElseThrow(() -> new NotFoundException("Perfil de passageiro não encontrado para esse usuário"));

        List<Pagamento> pagamentos = pagamentoRepository.findByPassageiroId(passageiro.getId());

        return pagamentos.stream()
                .map(PagamentoMapper::converterParaPagamentoDto)
                .toList();
    }

    public PagamentoDefaultResponseDto deletarPagamento(UUID id){
        var pagamento = pagamentoRepository.findById(id);
        if(pagamento.isEmpty()){
            throw new NotFoundException("Pagamento não encontrado");
        }

        pagamentoRepository.deleteById(id);
        return new PagamentoDefaultResponseDto("Pagamento removido com sucesso!");
    }

}
