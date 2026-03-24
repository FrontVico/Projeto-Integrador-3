package com.VanControl.VanControl.passageiros.service;

import com.VanControl.VanControl.passageiros.domain.dto.request.AtualizarPassageiroRequestDto;
import com.VanControl.VanControl.passageiros.domain.dto.response.PassageiroDefaultResponseDto;
import com.VanControl.VanControl.passageiros.domain.dto.response.PassageiroResponseDto;
import com.VanControl.VanControl.passageiros.domain.entity.Passageiro;
import com.VanControl.VanControl.passageiros.mapper.PassageiroMapper;
import com.VanControl.VanControl.passageiros.repository.PassageiroRepository;
import com.VanControl.VanControl.user.DTO.RegisterRequestDTO;
import com.VanControl.VanControl.user.Model.User.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

import static com.VanControl.VanControl.passageiros.mapper.PassageiroMapper.converterParaPassageiro;

@Service
@RequiredArgsConstructor
public class PassageiroService {

    private final PassageiroRepository passageiroRepository;

    public void cadastrarPassageiro(RegisterRequestDTO dto) {
        if(passageiroRepository.findByCpf(dto.cpf()) != null){
            throw new RuntimeException("Passageiro já cadastrado");
        }
        var passageiro = converterParaPassageiro(dto);
        passageiroRepository.save(passageiro);
    }

    public PassageiroResponseDto buscarPassageiroPorCpf(String cpf) {
        var passageiro = passageiroRepository.findByCpf(cpf);
        if(passageiro == null){
            throw new RuntimeException("Passageiro não encontrado");
        }

        verificarPermissaoAcesso(passageiro);

        return PassageiroMapper.converterParaPassageiroResponseDto(passageiro);

    }

    public List<PassageiroResponseDto> listarPassageiros() {
        return passageiroRepository.findAll()
                .stream()
                .map(PassageiroMapper::converterParaPassageiroResponseDto)
                .toList();
    }

    public PassageiroResponseDto atualizarPassageiro(String cpf, AtualizarPassageiroRequestDto dto) {
        var passageiro = passageiroRepository.findByCpf(cpf);
        if(passageiro == null){
            throw new RuntimeException("Passageiro não encontrado");
        }

        verificarPermissaoAcesso(passageiro);

        var passageiroAtualizado = Passageiro.builder()
                .nome(passageiro.getNome() != null ? passageiro.getNome() : dto.nome())
                .telefone(passageiro.getTelefone() != null ? passageiro.getTelefone() : dto.telefone())
                .email(passageiro.getEmail() != null ? passageiro.getEmail() : dto.email())
                .instituicaoEnsino(passageiro.getInstituicaoEnsino() != null ? passageiro.getInstituicaoEnsino() : dto.intituicaoEnsino())
                .turno(passageiro.getTurno() != null ? passageiro.getTurno() : dto.turno())
                .endereco(passageiro.getEndereco() != null ? passageiro.getEndereco() : dto.Endereco())
                .cep(passageiro.getCep() != null ? passageiro.getCep() : dto.cep())
                .build();

        passageiroRepository.save(passageiroAtualizado);
        return PassageiroMapper.converterParaPassageiroResponseDto(passageiroAtualizado);
    }

    public PassageiroDefaultResponseDto deletarPassageiro(String cpf) {
        var passageiro = passageiroRepository.findByCpf(cpf);
        if(passageiro == null){
            throw new RuntimeException("Passageiro não encontrado");
        }

        verificarPermissaoAcesso(passageiro);

        passageiroRepository.delete(passageiro);
        return new PassageiroDefaultResponseDto("Passageiro deletado com sucesso");
    }

    private void verificarPermissaoAcesso(Passageiro passageiro) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        var usuarioLogado = (User) auth.getPrincipal();

        boolean hasAdminRole = auth.getAuthorities().stream()
                .anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_ADMIN"));

        if(!hasAdminRole && !Objects.equals(usuarioLogado.getEmail(), passageiro.getEmail())) {
            throw new RuntimeException("Acesso negado");
        }
    }
}
