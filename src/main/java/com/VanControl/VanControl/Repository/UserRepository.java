package com.VanControl.VanControl.Repository;

import com.VanControl.VanControl.Model.User.User;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
}
