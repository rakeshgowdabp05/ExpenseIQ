package com.expensetracker.config;

import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ConfiguredClientRegistrationRepository
        implements ClientRegistrationRepository,
        Iterable<ClientRegistration> {

    private final Map<String, ClientRegistration> registrations;

    public ConfiguredClientRegistrationRepository(
            List<ClientRegistration> clientRegistrations
    ) {
        Map<String, ClientRegistration> configured =
                new LinkedHashMap<>();

        for (ClientRegistration registration : clientRegistrations) {
            configured.put(
                    registration.getRegistrationId(),
                    registration
            );
        }

        registrations = Map.copyOf(configured);
    }

    @Override
    public ClientRegistration findByRegistrationId(
            String registrationId
    ) {
        return registrations.get(registrationId);
    }

    @Override
    public Iterator<ClientRegistration> iterator() {
        return registrations.values().iterator();
    }
}
