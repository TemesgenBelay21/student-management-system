package com.school.sms.controller;

import com.school.sms.dto.AuthResponse;
import com.school.sms.dto.LoginRequest;
import com.school.sms.model.User;
import com.school.sms.repository.UserRepository;
import com.school.sms.security.JwtUtil;
import com.school.sms.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Incorrect email or password");
        }

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtUtil.generateToken(principal, user.getRole().name());

        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name()));
    }
}
