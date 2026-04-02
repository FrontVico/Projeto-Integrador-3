package com.VanControl.VanControl.pagamentos.mapper;

import com.VanControl.VanControl.pagamentos.domain.dto.request.CadastrarPagamentoRequestDto;
import com.VanControl.VanControl.pagamentos.domain.dto.response.PagamentoResponseDto;
import com.VanControl.VanControl.pagamentos.domain.entity.Pagamento;
import com.VanControl.VanControl.passageiros.domain.entity.Passageiro;

import java.net.PasswordAuthentication;
import java.util.List;

public class PagamentoMapper {

    public static Pagamento converterParaPagamento(CadastrarPagamentoRequestDto dto, Passageiro passageiro){
       Pagamento pagamento = new Pagamento();

       pagamento.setPassageiro(passageiro);
       pagamento.setCompetencia(dto.competencia());
       pagamento.setValor(dto.valor());
       pagamento.setDataVencimento(dto.dataVencimento());

        return pagamento;
    }

    public static PagamentoResponseDto converterParaPagamentoDto(Pagamento pagamento){
        return new PagamentoResponseDto(
                pagamento.getCompetencia(),
                pagamento.getValor(),
                pagamento.getDataVencimento(),
                pagamento.getDataPagamento(),
                pagamento.getStatus()
        );
    }
}
