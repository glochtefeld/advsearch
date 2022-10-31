<?php

class SearchTerm {
    public String $dbfield;
    public bool $exact;
    public $search;
    public $type;
    public function __construct(Int $label, $data, Int $type, Bool $exact) {
        $this->dbfield = array_values($searchTerms)[$label];
        $this->search = $data;
        $this->exact = $exact;
        if (!$this->exact)
            $this->search = '%'.$this->search.'%';
        $this->type = $searchTypes[$type];
    }
    public function substitute() {
        if ($this->dbfield !== 0) {
            return $this->dbfield 
                . ($this->exact ? '=' : ' like ') 
                . ($this->type == 'i' ? '?' : "'". $this->exact ?"'"));
        }
    }
}

$searchTerms = [
    'any'=>0,
    'product_code'=>'IPP_ProductCode',
    'description'=>'IPP_Description',
    'alt_description'=>'IPP_DescriptionAlt'
];
$searchTypes = [ 's', 'i' ];

class Searcher extends DatabaseCaller {
    private $terms; // SearchTerm[]
    private $specified;
    private $anyTerms;
    public function interpret($terms) {
        $this->generateTerms($terms);
        return $this->search();
    }
    private function generateTerms($terms) {
        $params = array_chunk($terms, 4);
        foreach ($params as $p) {
            $t = new SearchTerm($p[0], $p[1], $p[2], $p[3]);
            if ($p[0]) $this->terms []= $t;
            else $this->anyTerms []= $t
        }
    }
    private function search() {
        $sql = 'select * 
            from TBL
            where ';
        $any = '(';
        $params = [];

        foreach ($this->terms as $t) {
            $sql .= $t->substitute();
            if ($t->exact) $this->specified[]=$t->dbfield;
            $params []= $t->search;
            if ($t !== array_key_last($this->terms)) $sql .= ' and ';
        }
        if (sizeof($this->anyTerms)) {
            $searches = array_diff(array_slice(array_values($searchTerms), 1), $this->specified);
            foreach ($this->anyTerms as $t) {
                foreach ($searches as $s) {
                    $any .= $s.' like '.$t->search;
                    $params []= $t->search;
                    if ($t !== array_key_last($this->anyTerms)) $any.=' or ';
                }
            }
            $any.=')';
            $sql.=' and '.$any;
        }
        
        $res = $this->db->retrieve($sql, $params);
        $this->escapeIfNull($res, 'Could not complete search', false);
        return $res;
    }
}

?>
