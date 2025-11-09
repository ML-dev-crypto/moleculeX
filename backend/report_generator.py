"""
PDF Report Generator using Jinja2 and WeasyPrint/ReportLab
"""
import os
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from typing import Dict, Any


class ReportGenerator:
    """Generates PDF reports from analysis results"""
    
    def __init__(self, template_dir: str = "templates", output_dir: str = None):
        # Convert relative paths to absolute paths
        base_dir = os.path.dirname(os.path.abspath(__file__))  # .../backend
        project_root = os.path.dirname(base_dir)
        # Templates live under backend/templates by default
        self.template_dir = (
            os.path.join(base_dir, template_dir)
            if not os.path.isabs(template_dir)
            else template_dir
        )
        # Reports should be served by main.py from project_root/data/reports
        reports_dir_env = os.getenv("REPORTS_DIR")
        default_reports_dir = os.path.join(project_root, "data", "reports")
        chosen_output = reports_dir_env or output_dir or default_reports_dir
        self.output_dir = (
            os.path.join(project_root, chosen_output)
            if not os.path.isabs(chosen_output)
            else chosen_output
        )
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Setup Jinja2 environment
        self.env = Environment(
            loader=FileSystemLoader(self.template_dir),
            autoescape=True
        )
    
    async def generate(self, job_id: str, query: str, analysis: Dict[str, Any]) -> str:
        """
        Generate PDF report from analysis results
        
        Args:
            job_id: Job identifier
            query: Original user query
            analysis: Analysis results with all findings
            
        Returns:
            Path to generated PDF file
        """
        print(f"📊 Generating report for job {job_id}")
        
        try:
            # Prepare template data
            template_data = self._prepare_template_data(job_id, query, analysis)
            
            # Render HTML from template
            template = self.env.get_template("report_template.html")
            html_content = template.render(**template_data)
            
            # Generate PDF
            pdf_path = os.path.join(self.output_dir, f"job_{job_id}.pdf")
            
            # Use xhtml2pdf (works on Windows without extra dependencies)
            try:
                from xhtml2pdf import pisa
                
                with open(pdf_path, "wb") as pdf_file:
                    pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)
                    
                if pisa_status.err:
                    raise Exception("PDF generation failed with xhtml2pdf")
                
                print(f"✅ Report generated with xhtml2pdf: {pdf_path}")
                return pdf_path
            except ImportError as e:
                print(f"⚠️ xhtml2pdf not available: {e}")
                print(f"💡 Install with: pip install xhtml2pdf")
                return await self._generate_fallback_report(job_id, query, analysis)
            except Exception as e:
                print(f"⚠️ xhtml2pdf failed: {e}")
                # Try alternative: WeasyPrint
                try:
                    import weasyprint
                    weasyprint.HTML(string=html_content).write_pdf(pdf_path)
                    print(f"✅ Report generated with WeasyPrint: {pdf_path}")
                    return pdf_path
                except ImportError:
                    print(f"⚠️ WeasyPrint not available")
                    print(f"💡 Install with: pip install weasyprint")
                    return await self._generate_fallback_report(job_id, query, analysis)
                except Exception as e2:
                    print(f"⚠️ WeasyPrint failed: {e2}, generating text fallback")
                    return await self._generate_fallback_report(job_id, query, analysis)
            
        except Exception as e:
            print(f"❌ Error generating report: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            # Create a simple text-based fallback
            return await self._generate_fallback_report(job_id, query, analysis)
    
    def _prepare_template_data(self, job_id: str, query: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare data for template rendering"""
        
        clinical_trials = analysis.get("clinical_trials", [])
        
        # Calculate active trials
        active_statuses = ["RECRUITING", "ACTIVE_NOT_RECRUITING", "ENROLLING_BY_INVITATION"]
        active_trials = sum(
            1 for trial in clinical_trials 
            if isinstance(trial, dict) and trial.get("status", "").upper() in active_statuses
        )
        
        # Get competition level
        competition = analysis.get("competition_analysis", {})
        competition_level = competition.get("competition_level", "unknown")
        
        return {
            "job_id": job_id,
            "query": query,
            "executive_summary": analysis.get("executive_summary", "No summary available."),
            "key_findings": analysis.get("key_findings", []),
            "clinical_trials": clinical_trials,
            "patents": analysis.get("patents", []),
            "web_intel": analysis.get("web_intel", []),
            "active_trials": active_trials,
            "competition_level": competition_level,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }
    
    async def _generate_fallback_report(self, job_id: str, query: str, analysis: Dict[str, Any]) -> str:
        """Generate simple text-based report as fallback"""
        print("📄 Generating text-based fallback report")
        
        txt_path = os.path.join(self.output_dir, f"job_{job_id}.txt")
        
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write("=" * 80 + "\n")
            f.write("MoleculeX Analysis Report\n")
            f.write("=" * 80 + "\n\n")
            f.write(f"Job ID: {job_id}\n")
            f.write(f"Query: {query}\n")
            f.write(f"Generated: {datetime.utcnow().isoformat()}\n\n")
            
            f.write("EXECUTIVE SUMMARY\n")
            f.write("-" * 80 + "\n")
            f.write(analysis.get("executive_summary", "N/A") + "\n\n")
            
            f.write("KEY FINDINGS\n")
            f.write("-" * 80 + "\n")
            for i, finding in enumerate(analysis.get("key_findings", []), 1):
                f.write(f"{i}. {finding}\n")
            f.write("\n")
            
            f.write("CLINICAL TRIALS\n")
            f.write("-" * 80 + "\n")
            trials = analysis.get("clinical_trials", [])
            f.write(f"Total trials found: {len(trials)}\n\n")
            
            for trial in trials[:10]:
                f.write(f"NCT ID: {trial.get('nct_id', 'N/A')}\n")
                f.write(f"Title: {trial.get('title', 'N/A')}\n")
                f.write(f"Status: {trial.get('status', 'N/A')}\n")
                f.write("-" * 40 + "\n")
        
        print(f"✅ Fallback report generated: {txt_path}")
        return txt_path
