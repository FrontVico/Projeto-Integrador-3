package com.VanControl.VanControl.commons.util;

import com.VanControl.VanControl.user.Model.User.Role;
import com.VanControl.VanControl.user.Model.User.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SecurityUtils - Testes de validação de acesso por CPF")
class SecurityUtilsTest {

    @InjectMocks
    private SecurityUtils securityUtils;

    private User passageiroUser;
    private User motoristaUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        // Criar usuário passageiro
        passageiroUser = new User();
        passageiroUser.setId("user-passageiro-id");
        passageiroUser.setName("João Silva");
        passageiroUser.setEmail("joao@email.com");
        passageiroUser.setCpf("12345678901");
        passageiroUser.setRole(Role.PASSAGEIRO);

        // Criar usuário motorista
        motoristaUser = new User();
        motoristaUser.setId("user-motorista-id");
        motoristaUser.setName("Maria Santos");
        motoristaUser.setEmail("maria@email.com");
        motoristaUser.setCpf("98765432100");
        motoristaUser.setRole(Role.MOTORISTA);

        // Criar usuário admin
        adminUser = new User();
        adminUser.setId("user-admin-id");
        adminUser.setName("Admin User");
        adminUser.setEmail("admin@email.com");
        adminUser.setCpf("11111111111");
        adminUser.setRole(Role.ADMIN);
    }

    @Test
    @DisplayName("Deve obter o usuário autenticado com sucesso")
    void deveObterUsuarioAutenticado() {
        // Arrange
        authenticateUser(passageiroUser);

        // Act
        User result = securityUtils.getAuthenticatedUser();

        // Assert
        assertNotNull(result);
        assertEquals(passageiroUser.getId(), result.getId());
        assertEquals(passageiroUser.getEmail(), result.getEmail());
    }

    @Test
    @DisplayName("Deve lançar exceção quando usuário não está autenticado")
    void deveLancarExcecaoQuandoUsuarioNaoAutenticado() {
        // Arrange
        SecurityContextHolder.clearContext();

        // Act & Assert
        assertThrows(AccessDeniedException.class, () -> securityUtils.getAuthenticatedUser());
    }

    @Test
    @DisplayName("Deve obter CPF do usuário autenticado com sucesso")
    void deveObterCpfDoUsuarioAutenticado() {
        // Arrange
        authenticateUser(passageiroUser);

        // Act
        String cpf = securityUtils.getAuthenticatedUserCpf();

        // Assert
        assertEquals("12345678901", cpf);
    }

    @Test
    @DisplayName("Deve lançar exceção quando usuário não possui CPF")
    void deveLancarExcecaoQuandoUsuarioNaoPossuiCpf() {
        // Arrange
        User userSemCpf = new User();
        userSemCpf.setId("user-id");
        userSemCpf.setRole(Role.PASSAGEIRO);
        authenticateUser(userSemCpf);

        // Act & Assert
        assertThrows(AccessDeniedException.class, () -> securityUtils.getAuthenticatedUserCpf());
    }

    @Test
    @DisplayName("Deve permitir que PASSAGEIRO acesse seus próprios dados")
    void devePermitirPassageiroAcessarProprioDados() {
        // Arrange
        authenticateUser(passageiroUser);

        // Act & Assert
        assertDoesNotThrow(() -> securityUtils.validateCpfAccess("12345678901"));
    }

    @Test
    @DisplayName("Deve bloquear PASSAGEIRO de acessar dados de outro usuário")
    void deveBloquearPassageiroAcessarDadosDeOutroUsuario() {
        // Arrange
        authenticateUser(passageiroUser);

        // Act & Assert
        AccessDeniedException exception = assertThrows(AccessDeniedException.class,
                () -> securityUtils.validateCpfAccess("98765432100"));

        assertEquals("Você não tem permissão para acessar dados de outro usuário", exception.getMessage());
    }

    @Test
    @DisplayName("Deve permitir que ADMIN acesse dados de qualquer CPF")
    void devePermitirAdminAcessarQualquerCpf() {
        // Arrange
        authenticateUser(adminUser);

        // Act & Assert
        assertDoesNotThrow(() -> securityUtils.validateCpfAccess("12345678901"));
        assertDoesNotThrow(() -> securityUtils.validateCpfAccess("98765432100"));
        assertDoesNotThrow(() -> securityUtils.validateCpfAccess("00000000000"));
    }

    @Test
    @DisplayName("Deve permitir que MOTORISTA acesse dados de qualquer CPF")
    void devePermitirMotoristaAcessarQualquerCpf() {
        // Arrange
        authenticateUser(motoristaUser);

        // Act & Assert
        assertDoesNotThrow(() -> securityUtils.validateCpfAccess("12345678901"));
        assertDoesNotThrow(() -> securityUtils.validateCpfAccess("98765432100"));
        assertDoesNotThrow(() -> securityUtils.validateCpfAccess("00000000000"));
    }

    @Test
    @DisplayName("Deve permitir que MOTORISTA acesse seus próprios dados")
    void devePermitirMotoristaAcessarProprioDados() {
        // Arrange
        authenticateUser(motoristaUser);

        // Act & Assert
        assertDoesNotThrow(() -> securityUtils.validateCpfAccess("98765432100"));
    }

    @Test
    @DisplayName("Deve validar que PASSAGEIRO com CPF diferente é bloqueado")
    void deveValidarBloqueioPassageiroComCpfDiferente() {
        // Arrange
        authenticateUser(passageiroUser);
        String cpfDiferente = "99999999999";

        // Act & Assert
        AccessDeniedException exception = assertThrows(AccessDeniedException.class,
                () -> securityUtils.validateCpfAccess(cpfDiferente));

        assertTrue(exception.getMessage().contains("não tem permissão"));
    }

    @Test
    @DisplayName("Deve validar comparação exata de CPF para PASSAGEIRO")
    void deveValidarComparacaoExataDeCpf() {
        // Arrange
        authenticateUser(passageiroUser);

        // Act & Assert - CPF exato deve funcionar
        assertDoesNotThrow(() -> securityUtils.validateCpfAccess("12345678901"));

        // CPF com um dígito diferente deve falhar
        assertThrows(AccessDeniedException.class,
                () -> securityUtils.validateCpfAccess("12345678900"));
    }

    private void authenticateUser(User user) {
        var authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
