package com.VanControl.VanControl.pagamentos.service;

import com.VanControl.VanControl.commons.exception.model.ConflictException;
import com.VanControl.VanControl.pagamentos.domain.dto.request.CadastrarPagamentoRequestDto;
import com.VanControl.VanControl.pagamentos.domain.dto.response.PagamentoDefaultResponseDto;
import com.VanControl.VanControl.pagamentos.domain.entity.Pagamento;
import com.VanControl.VanControl.pagamentos.domain.enums.StatusPagamento;
import com.VanControl.VanControl.pagamentos.mapper.PagamentoMapper;
import com.VanControl.VanControl.pagamentos.repository.PagamentoRepository;
import com.VanControl.VanControl.passageiros.domain.entity.Passageiro;
import com.VanControl.VanControl.passageiros.repository.PassageiroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import static com.VanControl.VanControl.pagamentos.mapper.PagamentoMapper.converterParaPagamento;

@Service
@RequiredArgsConstructor
public class PagamentoService{

    private final PagamentoRepository pagamentoRepository;
    private final PassageiroRepository passageiroRepository;

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


}
