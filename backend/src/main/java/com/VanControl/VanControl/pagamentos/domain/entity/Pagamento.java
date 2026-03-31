package com.VanControl.VanControl.pagamentos.domain.entity;

import com.VanControl.VanControl.pagamentos.domain.enums.StatusPagamento;
import com.VanControl.VanControl.passageiros.domain.entity.Passageiro;
import com.VanControl.VanControl.veiculos.domain.enums.StatusEnum;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "passageiro_id")
    private Passageiro passageiro;

    private String competencia;
    private BigDecimal valor;
    private LocalDate dataVencimento;
    private LocalDate dataPagamento;

    @Enumerated(EnumType.STRING)
    private StatusPagamento status;

    public Pagamento(Passageiro passageiroId, String competencia, BigDecimal valor, LocalDate dataVencimento) {
        this.passageiro = passageiro;
        this.competencia = competencia;
        this.valor = valor;
        this.dataVencimento = dataVencimento;
    }
}
