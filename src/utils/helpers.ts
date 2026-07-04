export function technologiesHelper(technologies: { name: string; type: string; poweredByNodejs: boolean }[]): string {
    const filtered = technologies.filter(t => t.poweredByNodejs);
    let html = '<ul>';
    for (const tech of filtered) {
        html += `<li>${tech.name} - ${tech.type}</li>`;
    }
    html += '</ul>';
    return html;
}
