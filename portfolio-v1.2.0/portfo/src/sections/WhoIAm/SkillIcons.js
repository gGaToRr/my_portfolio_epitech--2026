import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useEditableContent } from '../../context/EditableContentContext';
import { renderIcon } from '../../utils/iconRegistry';
import './SkillIcons.css';

function SkillIcons() {
    const { lang } = useLanguage();
    const { skills } = useEditableContent();

    return (
        <div className="skill-grid-icons">
            {(skills || []).map((skill) => {
                const name = lang === 'fr' ? (skill.nameFr || skill.name) : (skill.nameEn || skill.name || skill.nameFr);
                const category = lang === 'fr' ? (skill.categoryFr || skill.category) : (skill.categoryEn || skill.category || skill.categoryFr);
                const color = skill.color || '#00f2fe';

                return (
                    <div
                        key={skill.id || skill.name}
                        className="skill-item"
                        style={{ '--accent-skill': color }}
                        title={`${name} (${category || ''})`}
                    >
                        <div className="skill-item__icon-wrap">
                            {renderIcon(skill.iconKey, { className: 'skill-item__icon' })}
                        </div>
                        <span className="skill-item__name">{name}</span>
                        {category && <span className="skill-item__category">{category}</span>}
                    </div>
                );
            })}
        </div>
    );
}

export default SkillIcons;
